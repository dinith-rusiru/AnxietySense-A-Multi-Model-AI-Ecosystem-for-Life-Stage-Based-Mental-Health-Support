import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image, ScrollView } from 'react-native';

function LinkPreview({ title, url, onPress }) {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ title: null, description: null, image: null });

  useEffect(() => {
    let cancelled = false;
    const fetchMeta = async () => {
      try {
        const res = await fetch(url);
        const html = await res.text();
        const extract = (property) => {
          const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
          const m = html.match(re);
          return m?.[1] ?? null;
        };
        const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
        const data = {
          title: extract('og:title') || titleTagMatch?.[1] || title,
          description: extract('og:description'),
          image: extract('og:image'),
        };
        if (!cancelled) setMeta(data);
      } catch (e) {
        if (!cancelled) setMeta({ title, description: null, image: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMeta();
    return () => { cancelled = true; };
  }, [url]);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      {meta.image ? (
        <Image source={{ uri: meta.image }} style={styles.previewImage} />
      ) : (
        <View style={[styles.previewImage, styles.previewPlaceholder]}>
          <Text style={styles.placeholderText}>{loading ? 'Loading preview…' : 'No preview available'}</Text>
        </View>
      )}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{meta.title || title}</Text>
        {meta.description ? (
          <Text style={styles.itemDesc} numberOfLines={2}>{meta.description}</Text>
        ) : null}
        <Text style={styles.itemUrl} numberOfLines={1}>{url}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RelaxScreen() {
  const songs = [
    { title: 'Vikasitha Pem', url: 'https://www.youtube.com/watch?v=2Q7QZXcuAJY&list=RD2Q7QZXcuAJY&start_radio=1' },
    { title: 'Snehaye Nagarayai', url: 'https://www.youtube.com/watch?v=62JQewyUThg&list=RD2Q7QZXcuAJY&index=3' },
    { title: 'Sulanga Numba Wage', url: 'https://www.youtube.com/watch?v=eR3RoDb35_8&list=RD2Q7QZXcuAJY&index=13' },
    { title: 'Sandakan Daharin', url: 'https://www.youtube.com/watch?v=o-JBsrTTcUw&list=RDo-JBsrTTcUw&start_radio=1' },
    { title: 'Malata Suwanda Se', url: 'https://www.youtube.com/watch?v=rLsWAkeg2AU&list=RDrLsWAkeg2AU&start_radio=1' },
    
  ];

  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Songs for Relaxation</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {songs.map((s, idx) => (
          <LinkPreview
            key={idx}
            title={s.title}
            url={s.url}
            onPress={() => openUrl(s.url)}
          />
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  list: { gap: 12 },
  item: { padding: 0, borderRadius: 10, backgroundColor: '#EAF4F4', overflow: 'hidden' },
  previewImage: { width: '100%', height: 180 },
  previewPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDE7E7' },
  placeholderText: { color: '#666' },
  itemContent: { padding: 14 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  itemDesc: { fontSize: 14, color: '#555', marginBottom: 6 },
  itemUrl: { fontSize: 13, color: '#007AFF' },
});
