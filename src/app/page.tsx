//used for debugging Node.js applications programmatically.
import { Session } from 'inspector/promises';
// import HamburgerMenu from './Components/HamburgerMenu';
import GitCommandGenerator from './Components/GitCommandGenerator'

export default function Home() {
  return (
    <>
      {/* 标题部分 - 使用居中样式类 */}
      <div className="centered-heading">
        <h1>
          FlowCode is a purpose-built platform for automated development workflows.
        </h1>
      </div>
      
      {/* 描述部分 - 使用对齐样式类 */}
      <div className="aligned-description">
        <p>
          Meet the system for modern DevOps. Orchestrate Git, Docker, and testing with seamless automation to accelerate building, shipping, and scaling software.
        </p>
      </div>
      
      {/* Git命令生成器组件 */}
      <GitCommandGenerator />
    </>
  );
}