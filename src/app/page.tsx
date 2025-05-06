"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";

export default function LandingPage() {
  const { user, signInWithGoogle } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Organize Your Tasks with Ease
          </h1>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-600 leading-relaxed">
            A simple, elegant todo app that helps you stay on top of your tasks.
            Create, manage, and track your todos with our intuitive interface.
          </p>
          <div className="space-y-4">
            {user ? (
              <Link href="/todo">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Go to Todo App
                </Button>
              </Link>
            ) : (
              <Button
                onClick={signInWithGoogle}
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started with Google
              </Button>
            )}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl text-gray-900 font-semibold mb-3">
              Simple & Intuitive
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Clean interface designed for maximum productivity and ease of use.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl text-gray-900 font-semibold mb-3">
              Smart Organization
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Sort and filter your tasks to keep your workflow organized.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl text-gray-900 font-semibold mb-3">
              Track Progress
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your completed tasks and stay motivated with your
              progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
