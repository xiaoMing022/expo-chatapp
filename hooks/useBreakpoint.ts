// hooks/useBreakpoint.ts
import { useWindowDimensions } from "react-native";

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    isSmall: width < 768,
    isLarge: width >= 768,
  };
}
