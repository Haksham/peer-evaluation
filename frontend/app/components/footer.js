export default function Footer() {
  return (
    <footer className="w-full mt-10 py-4 bg-gray-100 border-t text-center text-sm text-gray-600">
      <div>
        &copy; {new Date().getFullYear()} Project Review Platform &mdash; Built with ❤️ by Harsh_VM & Mitesh_Jain
      </div>
      <div className="mt-1">
        <a
          href="https://github.com/haksham/peer-evaluation"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}