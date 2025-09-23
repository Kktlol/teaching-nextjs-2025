SELECT album_id,
  COUNT(*) AS song_count
FROM songs
GROUP BY album_id;