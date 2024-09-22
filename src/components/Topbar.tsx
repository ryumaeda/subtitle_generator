import React, { useState } from "react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/supabase";

const Topbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter() as unknown as NextRouter; // 修正

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    (router as unknown as NextRouter).push("/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-blue-600">
                AI-Powered 字幕生成アプリ
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`text-gray-600 hover:text-blue-600 text-xl ${
                (router as unknown as NextRouter).pathname === "/"
                  ? "font-bold"
                  : ""
              }`}
            >
              ホーム
            </Link>
            <Link
              href="/subtitle-generation"
              className={`text-gray-600 hover:text-blue-600 text-xl ${
                router.pathname === "/subtitle-generation" ? "font-bold" : ""
              }`}
            >
              字幕生成
            </Link>
            <Link
              href="/learning"
              className={`text-gray-600 hover:text-blue-600 text-xl ${
                router.pathname === "/learning" ? "font-bold" : ""
              }`}
            >
              学習
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600">
              <FaUser className="text-xl" />
            </button>
            <button
              className="text-gray-600 hover:text-blue-600"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="text-xl" />
            </button>
            <button
              className="md:hidden text-gray-600 hover:text-blue-600"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col space-y-2 py-4 px-4">
            <Link
              href="/"
              className={`text-gray-600 hover:text-blue-600 ${
                router.pathname === "/" ? "font-bold" : ""
              }`}
            >
              ホーム
            </Link>
            <Link
              href="/subtitle-generation"
              className={`text-gray-600 hover:text-blue-600 ${
                router.pathname === "/subtitle-generation" ? "font-bold" : ""
              }`}
            >
              字幕生成
            </Link>
            <Link
              href="/learning"
              className={`text-gray-600 hover:text-blue-600 ${
                router.pathname === "/learning" ? "font-bold" : ""
              }`}
            >
              学習
            </Link>
            <button
              className="text-left text-gray-600 hover:text-blue-600"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Topbar;
