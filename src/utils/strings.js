export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function fileBasename(filePath) {
    // 使用正则表达式匹配文件名部分
    const baseNameMatch = filePath.match(/\/?([^/]+)$/);
    if (baseNameMatch && baseNameMatch[1]) {
        return baseNameMatch[1];
    } else {
        // 如果无法匹配到文件名，则返回整个路径字符串
        return filePath;
    }
}