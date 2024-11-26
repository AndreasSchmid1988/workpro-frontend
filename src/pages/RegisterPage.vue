<template>
  <div class="main_bg">
    <div class="flex flex-center" style="min-height: 100vh">
      <AccountRegisterForm></AccountRegisterForm>
    </div>
  </div>
</template>

<script setup>
import AccountRegisterForm from 'components/register/AccountRegisterForm.vue';
</script>

<style scoped>
.main_bg {
  /*
    background: url('background.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    */
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
}

:deep(.shadow_custom) {
  box-shadow: none !important;
}

/* Mobile-first approach */
.q-card-responsive {
  width: 95%; /* Adjusted for slightly more margins on mobile */
}

/* Medium devices */
@media screen and (min-width: 768px) {
  :deep(.shadow_custom) {
    box-shadow: 0 5px 70px 0 rgb(0, 0, 0, 0.45) !important;
  }

  .q-card-responsive {
    width: 650px;
  }
}

/* Larger devices */
@media screen and (min-width: 1199px) {
  :deep(.shadow_custom) {
    box-shadow: 0 5px 70px 0 rgb(0, 0, 0, 0.45) !important;
  }

  .q-card-responsive {
    width: 750px;
  }
}
</style>
