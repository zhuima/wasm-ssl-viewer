export async function loadWasmModule(path: string) {
    try {
      // 动态导入 WebAssembly 模块
      const response = await fetch(path);
      const buffer = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(buffer);
      
      return {
        instance: wasmModule.instance,
        module: wasmModule.module
      };
    } catch (error) {
      console.error('Failed to load WebAssembly module:', error);
      throw error;
    }
  }