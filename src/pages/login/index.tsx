import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/supabase";
import * as THREE from "three";

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);

      const geometry = new THREE.TorusKnotGeometry(10, 3, 200, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0xf0f0f0,
        wireframe: true,
        shininess: 100,
        specular: 0xffffff,
      });
      const torusKnot = new THREE.Mesh(geometry, material);
      scene.add(torusKnot);

      const light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(0, 0, 20);
      scene.add(light);

      camera.position.z = 30;

      const animate = () => {
        requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.01;
        torusKnot.rotation.z += 0.005;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      setError("ログインに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="relative flex-grow flex flex-col min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
      <span className="text-3xl font-bold text-white ml-8 mt-8">
        AI-Powered 字幕生成アプリ
      </span>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="relative z-10 flex-grow flex items-center justify-center top-40">
        <h2 className="text-7xl text-white opacity-70">
          スタイリッシュな
          <br />
          <span className="mt-6 block">動画編集を始めよう</span>
        </h2>
      </div>
      <div className="relative z-10 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-black bg-opacity-30 p-10 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg flex flex-col items-center justify-center">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-64 flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-black bg-white hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FcGoogle className="h-6 w-6" />
            </span>
            Login
          </button>
          {error && (
            <div className="text-red-400 text-center mt-2">{error}</div>
          )}
        </div>
      </div>
      <div className="relative z-10 flex-grow"></div>
    </div>
  );
};

export default Login;
