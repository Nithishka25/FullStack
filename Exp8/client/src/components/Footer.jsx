export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <div>&copy; {new Date().getFullYear()} Classifieds. All rights reserved.</div>
        <div className="sm:ml-auto">Built with MERN + Socket.io + Stripe</div>
      </div>
    </footer>
  );
}
