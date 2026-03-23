export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold">Bash n Build</a>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/articles" className="hover:underline">Articles</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
