export default defineNuxtRouteMiddleware(() => {
  if (import.meta.dev) {
    return
  }
  return navigateTo('/')
})
