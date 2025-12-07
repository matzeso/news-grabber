export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retryDelayMs: number = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryDelayMs));

    // Retry once
    return await fn();
  }
}
