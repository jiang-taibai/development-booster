// 该文件用于解析执行 "pip config debug" 后得到的结果
/*
在开发环境中所得到的测试结果：

==================================================
env_var:
env:
global:
  C:\ProgramData\pip\pip.ini, exists: True
    global.index-url: http://pypi.douban.com/simple
    global.extra-index-url: https://mirrors.cernet.edu.cn/pypi/web/simple https://mirrors.bfsu.edu.cn/pypi/web/simple
site:
  D:\Environments\Anaconda3\pip.ini, exists: False
user:
  C:\Users\Administrator\pip\pip.ini, exists: False
  C:\Users\Administrator\AppData\Roaming\pip\pip.ini, exists: True
    global.index-url: http://mirrors.aliyun.com/pypi/simple/
    install.trusted-host: mirrors.aliyun.com
==================================================

*/

// 预处理，将文本转换为数组，并且删去首位缩进、记录每一行的缩进级别
const preprocessing = (text) => {
    const lines = text.split("\n"); // 将文本按行拆分成数组
    let levelOfLines = []; // 用于存储每一行的缩进级别

    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        const indentCount = line.search(/\S/); // 计算缩进级别，即行首非空白字符的索引
        switch (indentCount) {
            case -1:
                levelOfLines.push(0);
                break;
            case 0:
                levelOfLines.push(1);
                break;
            case 2:
                levelOfLines.push(2);
                break;
            case 4:
                levelOfLines.push(3);
                break;
            default:
                throw new Error("Unexpected indentCount: " + indentCount);
        }
        lines[i] = line.trim();
    }

    return {
        lines,
        levelOfLines
    }

}

// 递归地解析文本成一个名键对数组，其中key为字符串，value为名键对数组
const recursion = (lines, levelOfLines, begin, end) => {

    if (begin >= end) return null;

    let i, j;
    let result = []

    for (i = begin; i <= end; ++i) {
        for (j = i + 1; j <= end; ++j) {
            if (levelOfLines[i] >= levelOfLines[j]) {
                result.push({
                    key: lines[i],
                    value: recursion(lines, levelOfLines, i + 1, j)
                })
                break;
            }
            if (j === end && levelOfLines[i] < levelOfLines[j]) {
                result.push({
                    key: lines[i],
                    value: recursion(lines, levelOfLines, i + 1, j)
                })
                break;
            }
        }

        i = j - 1;
    }

    return result;
}

// 将名键对数组转换为对象，在本功能需求中，至多解析到第三层
const convertToObject = (pairs) => {
    let result = {};
    for (let pair of pairs) {
        // 如果该范围下没有配置文件，则跳过该范围
        if (!pair.value) continue;
        let scope = pair.key;
        if (pair.key.endsWith(":")) {
            // 使用 slice() 方法删除最后一个字符
            scope = pair.key.slice(0, -1);
        }
        result[scope] = [];
        // 由于同一个范围的配置中可能存在多个配置文件，因此遍历每一个配置文件
        for (let subPair of pair.value) {
            if (!subPair.value) continue;
            let filePath = subPair.key;
            let allConfigs = [];
            // 每个配置文件中可能存在多个配置项，因此遍历每一个配置项
            let configArray = subPair.value;
            for (let configPair of configArray) {
                // 在文本中，配置项的格式为 "key: value"，因此需要将其拆分为键值对
                let configString = configPair.key;
                let colonIndex = configString.indexOf(":");
                let configName = configString.slice(0, colonIndex);
                let configValue = configString.slice(colonIndex + 1);
                allConfigs.push({
                    key: configName,
                    value: configValue.trim().split(" ")
                })
            }
            result[scope].push({
                file: filePath,
                configs: allConfigs
            })
        }
    }
    return result;
}

/**
 * 将对象简化：
 * 1. 无需记录文件路径
 * 2. 同一范围下的配置项可以合并
 */
const simplify = (obj) => {
    let result = {
        'env_var': {},
        'env': {},
        'global': {
            'global.index-url': [],
            'global.extra-index-url': [],
        },
        'site': {
            'global.index-url': [],
            'global.extra-index-url': [],
        },
        'user': {
            'global.index-url': [],
            'global.extra-index-url': [],
        },
    };
    for (let scope in obj) {
        if (!result[scope]) result[scope] = {};
        for (let configFile of obj[scope]) {
            for (let configPair of configFile.configs) {
                // 对于同一范围下，不同文件中的同一配置项，有两种策略
                // [×] 策略1：最后一个配置项覆盖前面的配置项
                // result[scope][configPair.key] = configPair.value;
                // [√] 策略2：将所有配置项合并
                if (!result[scope][configPair.key]) {
                    result[scope][configPair.key] = configPair.value;
                } else {
                    result[scope][configPair.key] = [...new Set([...result[scope][configPair.key], ...configPair.value])]
                }
            }
        }
    }
    return result;
}

const resolve = (text) => {
    const {lines, levelOfLines} = preprocessing(text);
    const pairs = recursion(lines, levelOfLines, 0, lines.length - 1);
    const result = simplify(convertToObject(pairs));
    return result;
}

// const text = `env_var:
// env:
// global:
//   C:\\ProgramData\\pip\\pip.ini, exists: True
//     global.index-url: http://pypi.douban.com/simple
//     global.extra-index-url: https://mirrors.cernet.edu.cn/pypi/web/simple https://mirrors.bfsu.edu.cn/pypi/web/simple
// site:
//   D:\\Environments\\Anaconda3\\pip.ini, exists: False
// user:
//   C:\\Users\\Administrator\\pip\\pip.ini, exists: True
//     global.index-url: http://mirrors.aliyun.com/pypi/simple2/
//   C:\\Users\\Administrator\\AppData\\Roaming\\pip\\pip.ini, exists: True
//     global.index-url: http://mirrors.aliyun.com/pypi/simple/
//     install.trusted-host: mirrors.aliyun.com`

export default resolve;