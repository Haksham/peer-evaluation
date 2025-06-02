export default function Header() {
  return (
    <header className="w-full py-4 bg-blue-700 text-white shadow mb-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
        <div className="text-xl font-bold tracking-wide">
          Project Review Platform
        </div>
        <nav className="space-x-4 text-sm">
          <a href="/" className="hover:underline">
            Home
          </a>
          <a
            href="https://github.com/haksham/peer-evaluation"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}