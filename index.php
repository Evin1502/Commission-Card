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



<audio id="bgMusic" src="assets/music.mp3" loop preload="auto"></audio>
<div class="card">
<div class="sheet">
    <!-- Star Decorations -->
    <img class="star-deco s1" src="assets/Star 26.png" alt="" aria-hidden="true">
    <img class="star-deco s2" src="assets/Star 26.png" alt="" aria-hidden="true">
    <img class="star-deco s3" src="assets/Star 26.png" alt="" aria-hidden="true">
    <img class="star-deco s4" src="assets/Star 26.png" alt="" aria-hidden="true">
    <img class="star-deco s5" src="assets/Star 26.png" alt="" aria-hidden="true">

    <!-- Sparkles ✦ -->
    <span class="sparkle sp1" aria-hidden="true"></span>
    <span class="sparkle sp2" aria-hidden="true"></span>
    <span class="sparkle sp3" aria-hidden="true"></span>
    <span class="sparkle sp4" aria-hidden="true"></span>
    <span class="sparkle sp5" aria-hidden="true"></span>
    <span class="sparkle sp6" aria-hidden="true"></span>
    <span class="sparkle sp7" aria-hidden="true"></span>
    <span class="sparkle sp8" aria-hidden="true"></span>

    <?php include 'partials/header.php'; ?>

    <?php include 'partials/panel-home.php'; ?>
    <?php include 'partials/panel-sheet.php'; ?>
    <?php include 'partials/panel-tot.php'; ?>
    <?php include 'partials/panel-track.php'; ?>
    <?php include 'partials/panel-contact.php'; ?>

  </div>
  <footer id="footerField">feel free to chat 🖊</footer>
</div>

<script src="js/app.js"></script>
</body>
</html>
