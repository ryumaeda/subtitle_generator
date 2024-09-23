import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/supabase";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

const Topbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter() as unknown as NextRouter;

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data) {
        setUser(data.user as User);
      }
    };

    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    (router as unknown as NextRouter).push("/login");
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-3xl font-bold text-white">
                AI-Powered 字幕生成アプリ
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`text-white hover:shadow-lg text-xl ${
                (router as unknown as NextRouter).pathname === "/"
                  ? "font-bold"
                  : ""
              }`}
            >
              ホーム
            </Link>
            <Link
              href="/subtitle-generation"
              className={`text-white hover:shadow-lg text-xl ${
                router.pathname === "/subtitle-generation" ? "font-bold" : ""
              }`}
            >
              字幕生成
            </Link>
            <Link
              href="/learning"
              className={`text-white hover:shadow-lg text-xl ${
                router.pathname === "/learning" ? "font-bold" : ""
              }`}
            >
              学習
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Image
                src={user?.user_metadata?.avatar_url}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <button className="text-white hover:shadow-lg">
                <FaUser className="text-xl" />
              </button>
            )}
            <button
              className="text-white hover:shadow-lg"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="text-xl" />
            </button>
            <button
              className="md:hidden text-white hover:shadow-lg"
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
              className={`text-white hover:shadow-lg ${
                router.pathname === "/" ? "font-bold" : ""
              }`}
            >
              ホーム
            </Link>
            <Link
              href="/subtitle-generation"
              className={`text-white hover:shadow-lg ${
                router.pathname === "/subtitle-generation" ? "font-bold" : ""
              }`}
            >
              字幕生成
            </Link>
            <Link
              href="/learning"
              className={`text-white hover:shadow-lg ${
                router.pathname === "/learning" ? "font-bold" : ""
              }`}
            >
              学習
            </Link>
            <button
              className="text-left text-white hover:shadow-lg"
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
