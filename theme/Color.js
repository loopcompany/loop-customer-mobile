const palate = [
  {
    // 0 - neon blue
    color: "#002b54",
    bgColor: (opacity) => `rgba(0, 72, 143, ${opacity})`,
  },
  {
    // 1 - yellow
    color: "#ffd700ff",
    bgColor: (opacity) => `rgba(255, 215, 0, ${opacity})`,
  },
  {
    // 2 - blue
    color: "#082D81",
    bgColor: (opacity) => `rgba(8, 45, 129, ${opacity})`,
  },
  {
    // 3 - gray
    color: "#999999",
    bgColor: (opacity) => `rgba(153, 153, 153, ${opacity})`,
  },
  {
    // 4 - white
    color: "#FFFFFF",
    bgColor: (opacity) => `rgba(255, 255, 255, ${opacity})`,
  },
  {
    // 5 - background white
    color: "#FAFAFA",
    bgColor: (opacity) => `rgba(250, 250, 250, ${opacity})`,
  },
  {
    // 6 - red
    color: "#D12929",
    bgColor: (opacity) => `rgba(209, 41, 41, ${opacity})`,
  },
  {
    // 7 - green
    color: "#2e7d32",
    bgColor: (opacity) => `rgba(46, 125, 50, ${opacity})`,
  },
  {
    // 8 - blue
    color: "#6495ED",
    bgColor: (opacity) => `rgba(100, 149, 237, ${opacity})`,
  },
  {
    // 9 - purple
    color: "#6C3BAA",
    bgColor: (opacity) => `rgba(108, 59, 170, ${opacity})`,
  },
  {
    // 10 - black
    color: "#000000",
    bgColor: (opacity) => `rgba(0, 0, 0, ${opacity})`,
  },
  {
    // 11 - orange
    color: "#ee8a00",
    bgColor: (opacity) => `rgba(238, 138, 0, ${opacity})`,
  },
  {
    // 12 - dark gray
    color: "#1c1c1e",
    bgColor: (opacity) => `rgba(28, 28, 30, ${opacity})`,
  },
  {
    // 13 - dark blue
    color: "#003448",
    bgColor: (opacity) => `rgba(0, 52, 72, ${opacity})`,
  },
  {
    // 14 - light blue
    color: "#d1e9ff",
    bgColor: (opacity) => `rgba(209, 233, 255, ${opacity})`,
  },
];

export const themeColor0 = {
  //neon blue
  ...palate[0],
};

export const themeColor1 = {
  //yellow
  ...palate[1],
};

export const themeColor2 = {
  //mid gray
  ...palate[2],
};

export const themeColor3 = {
  //gray
  ...palate[3],
};

export const themeColor4 = {
  //white
  ...palate[4],
};

export const themeColor5 = {
  //background white
  ...palate[5],
};

export const themeColor6 = {
  //red
  ...palate[6],
};

export const themeColor7 = {
  //green
  ...palate[7],
};

export const themeColor8 = {
  //blue
  ...palate[8],
};

export const themeColor9 = {
  //purple
  ...palate[9],
};

export const themeColor10 = {
  //black
  ...palate[10],
};

export const themeColor11 = {
  //orange
  ...palate[11],
};

export const themeColor12 = {
  //dark gray
  ...palate[12],
};

export const themeColor13 = {
  //dark blue
  ...palate[13],
};

export const themeColor14 = {
  //light blue
  ...palate[14],
};
