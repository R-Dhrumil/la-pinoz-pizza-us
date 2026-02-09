import geolocation from "react-native-geolocation-service"

export default function getCurrentLocation() {
  return new Promise<{ latitude: number; longitude: number }>(
    (resolve, reject) => {
      geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 1500, maximumAge: 10000 },
      );
    },
  );
}
