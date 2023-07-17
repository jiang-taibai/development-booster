/**
 * 资料来源：
 * 1. MirrorsZ镜像：https://help.mirrors.cernet.edu.cn/pypi/
 * 2. 阿里云 PyPI镜像：https://developer.aliyun.com/mirror/pypi
 * 3. 腾讯云 PyPI镜像：https://mirrors.cloud.tencent.com/help/pypi.html
 * 4. 华为云 PyPI镜像：https://mirrors.huaweicloud.com/home
 * 5. 网易 PyPI镜像：https://mirrors.163.com/.help/pypi.html
 */


// 国内高校的开源镜像站
export const PipRegistriesFromUniversity = [
    {
        "label": "校园网联合镜像站",
        "value": "https://mirrors.cernet.edu.cn/pypi/web/simple"
    },
    {
        "label": "清华大学开源软件镜像站",
        "value": "https://pypi.tuna.tsinghua.edu.cn/simple"
    },
    {
        "label": "北京外国语大学开源软件镜像站",
        "value": "https://mirrors.bfsu.edu.cn/pypi/web/simple"
    },
    {
        "label": "哈尔滨工业大学开源镜像站",
        "value": "https://mirrors.hit.edu.cn/pypi/web/simple"
    },
    {
        "label": "南京大学开源镜像站",
        "value": "https://mirror.nju.edu.cn/pypi/web/simple"
    },
    {
        "label": "大连东软信息学院开源镜像站",
        "value": "https://mirrors.neusoft.edu.cn/pypi/web/simple"
    },
    {
        "label": "北京大学开源镜像站",
        "value": "https://mirrors.pku.edu.cn/pypi/web/simple"
    },
    {
        "label": "重庆邮电大学开源镜像站",
        "value": "https://mirrors.cqupt.edu.cn/pypi/web/simple"
    },
    {
        "label": "南京工业大学开源软件镜像站",
        "value": "https://mirrors.njtech.edu.cn/pypi/web/simple"
    },
    {
        "label": "上海科技大学 GeekPie 开源镜像站",
        "value": "https://mirrors.shanghaitech.edu.cn/pypi/web/simple"
    },
    {
        "label": "南阳理工学院开源镜像站",
        "value": "https://mirror.nyist.edu.cn/pypi/web/simple"
    },
    {
        "label": "思源镜像站",
        "value": "https://mirror.sjtu.edu.cn/pypi/web/simple"
    },
    {
        "label": "南方科技大学开源软件镜像站",
        "value": "https://mirrors.sustech.edu.cn/pypi/web/simple"
    },
    {
        "label": "西电开源软件镜像站",
        "value": "https://linux.xidian.edu.cn/mirrors/pypi/web/simple"
    },
    {
        "label": "浙江大学开源软件镜像站",
        "value": "https://mirrors.zju.edu.cn/pypi/web/simple"
    },
    {
        "label": "兰州大学开源社区镜像站",
        "value": "https://mirror.lzu.edu.cn/pypi/web/simple"
    },
    {
        "label": "吉林大学开源镜像站",
        "value": "https://mirrors.jlu.edu.cn/pypi/web/simple"
    }
]

// 国内企业的开源镜像站
export const PipRegistriesFromCompany = [
    {
        "label": "阿里云开源镜像站",
        "value": "https://mirrors.aliyun.com/pypi/simple"
    },
    {
        "label": "腾讯云开源镜像站",
        "value": "https://mirrors.cloud.tencent.com/pypi/simple"
    },
    {
        "label": "华为云开源镜像站",
        "value": "https://repo.huaweicloud.com/repository/pypi/simple"
    },
    {
        "label": "网易开源镜像站",
        "value": "https://mirrors.163.com/pypi/simple"
    },
    {
        "label": "豆瓣开源镜像站",
        "value": "https://pypi.douban.com/simple"
    }
]

export const PipRegistries = [
    {
        type: "group",
        label: "国内企业开源镜像站",
        key: "company",
        children: PipRegistriesFromCompany
    },
    {
        type: "group",
        label: "国内高校开源镜像站",
        key: "university",
        children: PipRegistriesFromUniversity
    },
]


// 爬取 MirrorsZ网站 过程
/*
// 在`https://help.mirrors.cernet.edu.cn/pypi/`中运行以下代码，获取所有镜像源的配置项
// 只写了个简单版本的，不能做到全自动化，还是得手动切换选择不同的镜像

let className = 'gVjJHb ycSPk kzDapR izykGz czZYaA jhKQav cRUUAa eXfkYj bToXQc fjiKus fnWCSy jsvbrX GUjLQ kuqFxU hsVIec hlZEzS owWWL cPsYMl ikqruN ctibpX FwRrA cDIyHz hpBjJb kwyfsE hBma_ds kDUNwo jDDXgi'
let selectElement = document.getElementsByClassName(className)[0];
let codeClassName = 'lowlight buttongroup_parent__VwQnh cjScYX ijgFCu'
let codeElement = document.getElementsByClassName(codeClassName)[0];
const allMirrors = {}
const interval = setInterval(() => {
  let key = selectElement.selectedOptions[0].value;
    let name = selectElement.selectedOptions[0].label;
    let command = codeElement.innerText;
    allMirrors[key] = {name, command};
}, 20)
const showResult = () => {
    console.log(JSON.stringify(allMirrors, null, 2))
}

// 输出结果：
let obj = {
  "CERNET": {
    "name": "CERNET - 校园网联合镜像站",
    "command": "pip install -i https://mirrors.cernet.edu.cn/pypi/web/simple some-package"
  },
  "TUNA": {
    "name": "TUNA - 清华大学开源软件镜像站",
    "command": "pip install -i https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple some-package"
  },
  "BFSU": {
    "name": "BFSU - 北京外国语大学开源软件镜像站",
    "command": "pip install -i https://mirrors.bfsu.edu.cn/pypi/web/simple some-package"
  },
  "HIT": {
    "name": "HIT - 哈尔滨工业大学开源镜像站",
    "command": "pip install -i https://mirrors.hit.edu.cn/pypi/web/simple some-package"
  },
  "NJU": {
    "name": "NJU - 南京大学开源镜像站",
    "command": "pip install -i https://mirror.nju.edu.cn/pypi/web/simple some-package"
  },
  "DNUI": {
    "name": "DNUI - 大连东软信息学院开源镜像站",
    "command": "pip install -i https://mirrors.neusoft.edu.cn/pypi/web/simple some-package"
  },
  "PKU": {
    "name": "PKU - 北京大学开源镜像站",
    "command": "pip install -i https://mirrors.pku.edu.cn/pypi/web/simple some-package"
  },
  "CQUPT": {
    "name": "CQUPT - 重庆邮电大学开源镜像站",
    "command": "pip install -i https://mirrors.cqupt.edu.cn/pypi/web/simple some-package"
  },
  "NJTech": {
    "name": "NJTech - 南京工业大学开源软件镜像站",
    "command": "pip install -i https://mirrors.njtech.edu.cn/pypi/web/simple some-package"
  },
  "ShanghaiTechGeekPie": {
    "name": "ShanghaiTech GeekPie - 上海科技大学GeekPie开源镜像站",
    "command": "pip install -i https://mirrors.shanghaitech.edu.cn/pypi/web/simple some-package"
  },
  "NYIST": {
    "name": "NYIST - 南阳理工学院开源镜像站",
    "command": "pip install -i https://mirror.nyist.edu.cn/pypi/web/simple some-package"
  },
  "SJTUG-Siyuan": {
    "name": "SJTUG - Siyuan - SJTUG思源镜像站",
    "command": "pip install -i https://mirror.sjtu.edu.cn/pypi/web/simple some-package"
  },
  "SUSTechCRA": {
    "name": "SUSTech CRA - 南方科技大学开源软件镜像站",
    "command": "pip install -i https://mirrors.sustech.edu.cn/pypi/web/simple some-package"
  },
  "Xidian": {
    "name": "Xidian - 西电开源软件镜像站",
    "command": "pip install -i https://linux.xidian.edu.cn/mirrors/pypi/web/simple some-package"
  },
  "ZJU": {
    "name": "ZJU - 浙江大学开源软件镜像站",
    "command": "pip install -i https://mirrors.zju.edu.cn/pypi/web/simple some-package"
  },
  "LZUOSS": {
    "name": "LZUOSS - 兰州大学开源社区镜像站",
    "command": "pip install -i https://mirror.lzu.edu.cn/pypi/web/simple some-package"
  },
  "JLU": {
    "name": "JLU - 吉林大学开源镜像站",
    "command": "pip install -i https://mirrors.jlu.edu.cn/pypi/web/simple some-package"
  }
}

// 通过数据清洗
function main() {
  let options = []
  for(let key in obj) {
    let label = obj[key].name.split(" ")[obj[key].name.split(" ").length - 1];
    let value = obj[key].command.split(" ")[3];
    options.push({
      label, value
    })
  }
  return options;
}

console.log(JSON.stringify(main(), null,  2))
*/

