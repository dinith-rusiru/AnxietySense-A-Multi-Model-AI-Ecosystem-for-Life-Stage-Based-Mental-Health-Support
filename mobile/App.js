import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

// API base
// - Expo Web (laptop browser): http://127.0.0.1:8000  (backend on same laptop)
// - Android Emulator: http://10.0.2.2:8000
// - Real phone: http://YOUR_PC_WIFI_IP:8000
const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://127.0.0.1:8000";

export default function App() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [showCamera, setShowCamera] = useState(false);
  const [live, setLive] = useState(false);

  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  // prevent overlapping requests
  const inFlight = useRef(false);

  const openCamera = async () => {
    const p = await requestPermission();
    if (!p.granted) {
      Alert.alert("Permission needed", "Please allow camera permission.");
      return;
    }
    setShowCamera(true);
  };

  const predictFromUri = async (uri) => {
    try {
      const form = new FormData();

      // ✅ Important difference: Web needs Blob; Mobile can use {uri, name, type}
      if (Platform.OS === "web") {
        const blob = await (await fetch(uri)).blob();
        form.append("image", blob, "frame.jpg");
      } else {
        form.append("image", {
          uri,
          name: "frame.jpg",
          type: "image/jpeg",
        });
      }

      const r = await fetch(`${API_BASE}/predict-emotion`, {
        method: "POST",
        body: form,
      });

      const data = await r.json();
      if (!r.ok || data.error) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch (e) {
      // don’t spam alerts every second
      console.log("predict error:", e.message);
    }
  };

  // LIVE LOOP: capture frame every 1.5 seconds
  useEffect(() => {
    let timer;

    if (showCamera && live) {
      timer = setInterval(async () => {
        try {
          if (!cameraRef.current) return;
          if (inFlight.current) return;

          inFlight.current = true;
          setBusy(true);

          const pic = await cameraRef.current.takePictureAsync({
            quality: 0.4,
            skipProcessing: true,
          });

          await predictFromUri(pic.uri);
        } catch (e) {
          console.log("live loop error:", e.message);
        } finally {
          inFlight.current = false;
          setBusy(false);
        }
      }, 1500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showCamera, live]);

  if (!showCamera) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#061A16" }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: "white" }}>Live Emotion Detection</Text>
        <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.7)" }}>
          Live preview + auto prediction every 1.5s
        </Text>

        <Pressable
          onPress={openCamera}
          style={{ marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: "#22C55E" }}
        >
          <Text style={{ textAlign: "center", fontWeight: "900", color: "#062016" }}>Open Camera</Text>
        </Pressable>

        <Text style={{ marginTop: 12, color: "rgba(255,255,255,0.6)" }}>
          Backend must be running: {API_BASE}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#061A16" }}>
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "white" }}>Camera Live</Text>
        <Text style={{ marginTop: 4, color: "rgba(255,255,255,0.7)" }}>
          Turn on Live Predict to see emotion.
        </Text>
      </View>

      {/* Live camera preview */}
      <View style={{ flex: 1, marginHorizontal: 16, borderRadius: 18, overflow: "hidden", backgroundColor: "#0B2A24" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
      </View>

      {/* Result overlay */}
      <View style={{ padding: 16 }}>
        <View
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: "#0B2A24",
            borderWidth: 1,
            borderColor: "rgba(34,197,94,0.25)",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>
            Live Predict:{" "}
            <Text style={{ color: live ? "#A7F3D0" : "rgba(255,255,255,0.6)" }}>
              {live ? "ON" : "OFF"}
            </Text>
          </Text>

          {busy && live ? (
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator />
              <Text style={{ color: "rgba(255,255,255,0.75)" }}>Predicting…</Text>
            </View>
          ) : null}

          {result ? (
            <>
              <Text style={{ marginTop: 10, color: "white", fontWeight: "900", fontSize: 16 }}>
                Emotion: <Text style={{ color: "#A7F3D0" }}>{result.emotion}</Text>
              </Text>
              <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.8)" }}>
                Confidence:{" "}
                <Text style={{ fontWeight: "900" }}>{(result.confidence * 100).toFixed(1)}%</Text>
              </Text>
            </>
          ) : (
            <Text style={{ marginTop: 8, color: "rgba(255,255,255,0.65)" }}>
              No prediction yet. Turn on Live Predict.
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => setLive((v) => !v)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              backgroundColor: live ? "rgba(255,255,255,0.12)" : "#22C55E",
              borderWidth: live ? 1 : 0,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "900", color: live ? "white" : "#062016" }}>
              {live ? "Stop Live Predict" : "Start Live Predict"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setLive(false);
              setShowCamera(false);
              setResult(null);
            }}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "900", color: "white" }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
