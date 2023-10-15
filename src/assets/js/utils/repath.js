// 增强路径鲁棒性：有些命令的路径不能有空格，否则会发生意想不到的错误
export const robustPath = (path) => {
    if (/\s/.test(path) && !/^".+"$/.test(path)) {
        return '"' + path + '"';
    }
    return path;
}








