import seedrandom from 'seedrandom';

// 计算字符串Hash并生成一个Avatar使用的样式信息
export function getStringToAvatarStyle(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rng = seedrandom(hash); // 使用 seedrandom 库创建随机数生成器
    const r = rng() * 200; // 200 - 尽量让颜色不要太亮
    const g = rng() * 200;
    const b = rng() * 200;
    // 计算亮度（使用简单的亮度计算公式 Y = 0.2126 * R + 0.7152 * G + 0.0722 * B）
    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return {
        background: `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`,
        color: brightness > 0.5 ? '#000000' : '#FFFFFF',
    };
}
