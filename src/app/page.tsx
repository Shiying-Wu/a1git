//在 page.tsx 里写首页内容(HomePage)，
//

import HamburgerMenu from './Components/HamburgerMenu';

export default function Home() {
  return (
    <div>
      <HamburgerMenu />
      <h1>Welcome to My Next.js App</h1>
    </div>
  );
}