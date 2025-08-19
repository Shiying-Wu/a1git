//This is HomePage
//1. onclick to select css class(dark/light)? global css
//about and home page 也是tsx？ 


import HamburgerMenu from './Components/HamburgerMenu';

export default function Home() {
  return (
    <div>
      <HamburgerMenu />
      <h1>Welcome to My Next.js App</h1>
    </div>
  );
}