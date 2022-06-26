export const isValidYTUrl = (url: any) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)
}
