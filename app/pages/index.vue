<template>
  <main class="home-container">
    <div class="hero-card">
      <NuxtLink to="/bookstore" class="explore-button">
        Access the Bookstore <span class="arrow">→</span>
      </NuxtLink>
    </div>
  </main>
</template>

<script setup>

</script>

<style scoped>

.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fcfcfc;
  padding: 20px;
  font-family: sans-serif;
}

.hero-card {
  text-align: center;
  max-width: 700px;
  padding: 60px 40px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.explore-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #F6E2B9; /* Nuanța de unt */
  color: #2c3e50; /* Text închis pentru contrast optim */
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(246, 226, 185, 0.5);
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
}

.explore-button:hover {
  background-color: #e6cd9d;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(246, 226, 185, 0.7);
}

.arrow {
  transition: transform 0.2s;
}

.explore-button:hover .arrow {
  transform: translateX(4px);
}

</style>