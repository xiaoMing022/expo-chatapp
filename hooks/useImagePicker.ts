import * as ImagePicker from "expo-image-picker";

export function useImagePicker() {
  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return null;

    const r2 = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (r2.canceled) return null;
    return r2.assets?.[0]?.uri ?? null;
  };

  return { pickImage };
}
