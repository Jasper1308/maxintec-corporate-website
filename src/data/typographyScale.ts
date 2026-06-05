export const typographyScale = {
  xs: "text-xs",      // 12px
  sm: "text-sm",      // 14px
  base: "text-base",  // 16px
  lg: "text-lg",      // 18px
  xl: "text-xl",      // 20px
  "2xl": "text-2xl",  // 24px
  "3xl": "text-3xl",  // 30px
  "4xl": "text-4xl",  // 36px
  "5xl": "text-5xl",  // 48px
  "6xl": "text-6xl",  // 60px
};

export const fontWeights = {
  light: "font-light",        // 300
  normal: "font-normal",      // 400
  medium: "font-medium",      // 500
  semibold: "font-semibold",  // 600
  bold: "font-bold",          // 700
  black: "font-black",        // 900
};

export const headingStyles = {
  h1: `${typographyScale["5xl"]} ${fontWeights.bold} leading-[1.1]`,
  h2: `${typographyScale["4xl"]} ${fontWeights.bold} leading-[1.2]`,
  h3: `${typographyScale["3xl"]} ${fontWeights.semibold} leading-[1.3]`,
  h4: `${typographyScale["2xl"]} ${fontWeights.semibold} leading-[1.4]`,
  subtitle: `${typographyScale.xl} ${fontWeights.medium} leading-[1.5]`,
  body: `${typographyScale.base} ${fontWeights.normal} leading-[1.6]`,
  small: `${typographyScale.sm} ${fontWeights.normal} leading-[1.5]`,
};

export const responsiveHeadings = {
  h1: "text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1]",
  h2: "text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.2]",
  h3: "text-xl sm:text-2xl lg:text-3xl font-semibold leading-[1.3]",
  h4: "text-lg sm:text-xl lg:text-2xl font-semibold leading-[1.4]",
  subtitle: "text-base sm:text-lg lg:text-xl font-medium leading-[1.5]",
  body: "text-sm sm:text-base lg:text-lg font-normal leading-[1.6]",
};
