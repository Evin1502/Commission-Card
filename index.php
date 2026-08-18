<?php
/**
 * Commission Card — index.php
 * Entry point utama. Semua bagian halaman di-include dari folder /partials/
 */
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <?php include 'partials/head.php'; ?>
</head>
<body>

<button class="edit-toggle" id="editToggle">✎ Edit mode: OFF</button>

<audio id="bgMusic" src="assets/music.mp3" loop preload="auto"></audio>
<div class="card">
  <div class="sheet">
    <span class="tape t1"></span>
    <span class="tape t2"></span>

    <?php include 'partials/header.php'; ?>

    <?php include 'partials/panel-home.php'; ?>
    <?php include 'partials/panel-sheet.php'; ?>
    <?php include 'partials/panel-tot.php'; ?>
    <?php include 'partials/panel-track.php'; ?>

  </div>
  <footer contenteditable="false" id="footerField">feel free to chat 🖊</footer>
</div>

<script src="js/app.js"></script>
</body>
</html>
