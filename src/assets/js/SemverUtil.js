/*
该正则表达式来源于 https://semver.org/
详细正则说明请看 https://regex101.com/r/vkijKf/1/
cg1(capture groups 1) = major, cg2 = minor, cg3 = patch, cg4 = prerelease and cg5 = buildmetadata

This regular expression is derived from https://semver.org/
Detailed description the regular see https://regex101.com/r/vkijKf/1/
cg1(capture groups 1) = major, cg2 = minor, cg3 = patch, cg4 = prerelease and cg5 = buildmetadata
 */

const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
const semverRegexIgnoreAnchor = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/

// 检验是否为合法的Semver格式的版本号
const isValid = (version) => {
    return semverRegex.test(version)
}

const containSemver = (str) => {
    return semverRegexIgnoreAnchor.test(str)
}

/**
 * 解析Semver格式的版本号，得到主版本号、次版本号、修订号、预发布号、元数据号
 * @param version Semver格式的版本号
 * @returns {patch: string, major: string, minor: string, buildMetaData: string, preRelease: string}
 */
const parse = (version) => {
    const match = version.match(semverRegex);
    if (match !== null) {
        const major = match[1] || '';
        const minor = match[2] || '';
        const patch = match[3] || '';
        const preRelease = match[4] || '';
        const buildMetaData = match[5] || '';
        return {
            major, minor, patch, preRelease, buildMetaData
        }
    }
    return {
        major: '', minor: '', patch: '', preRelease: '', buildMetaData: ''
    }
}

const parseIgnoreAnchor = (str) => {
    const match = str.match(semverRegexIgnoreAnchor);
    if (match !== null) {
        const version = match[0] || ''; // 完整匹配的字符串
        const major = match[1] || '';
        const minor = match[2] || '';
        const patch = match[3] || '';
        const preRelease = match[4] || '';
        const buildMetaData = match[5] || '';
        return {
            version, major, minor, patch, preRelease, buildMetaData
        }
    }
    return {
        version: '', major: '', minor: '', patch: '', preRelease: '', buildMetaData: ''
    }
}

export default {
    isValid,
    containSemver,
    parse,
    parseIgnoreAnchor,
}