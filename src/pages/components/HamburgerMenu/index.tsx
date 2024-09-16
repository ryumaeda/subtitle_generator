import React, { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AiOutlineHome, AiOutlineVideoCamera, AiOutlineSetting, AiOutlineLogout } from 'react-icons/ai';
import { FaBook } from 'react-icons/fa';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 bg-blue-500 text-white rounded-md"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-40`}
      >
        <nav className="flex flex-col h-full pt-16">
          <Link href="/home" className="p-4 flex items-center hover:bg-gray-100">
            <AiOutlineHome className="mr-2" size={20} />
            ホーム
          </Link>
          <Link href="/subtitle-generation" className="p-4 flex items-center hover:bg-gray-100">
            <AiOutlineVideoCamera className="mr-2" size={20} />
            字幕生成
          </Link>
          <Link href="/learning" className="p-4 flex items-center hover:bg-gray-100">
            <FaBook className="mr-2" size={20} />
            学習
          </Link>
          <Link href="/settings" className="p-4 flex items-center hover:bg-gray-100">
            <AiOutlineSetting className="mr-2" size={20} />
            設定
          </Link>
          <Link href="/logout" className="mt-auto p-4 flex items-center hover:bg-gray-100">
            <AiOutlineLogout className="mr-2" size={20} />
            ログアウト
          </Link>
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};

export default HamburgerMenu;