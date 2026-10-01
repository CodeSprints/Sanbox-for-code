export interface RunnableLanguage {
  id: string;
  label: string;
  runtime: string;
  version: string;
  filename: string;
  starter: string;
}

export const RUNNABLE_LANGUAGES: readonly RunnableLanguage[] = [
  {
    id: "python",
    label: "Python",
    runtime: "python",
    version: "3.10.0",
    filename: "main.py",
    starter: 'print("Hello from Python")\n\nfor index in range(3):\n    print("count", index)\n',
  },
  {
    id: "typescript",
    label: "TypeScript (Node)",
    runtime: "typescript",
    version: "5.0.3",
    filename: "main.ts",
    starter: 'const message: string = "Hello from TypeScript";\n\nconsole.log(message);\n',
  },
  {
    id: "javascript",
    label: "JavaScript (Node)",
    runtime: "javascript",
    version: "18.15.0",
    filename: "main.js",
    starter: 'console.log("Hello from Node.js");\n',
  },
  {
    id: "cpp",
    label: "C++",
    runtime: "c++",
    version: "10.2.0",
    filename: "main.cpp",
    starter:
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++" << std::endl;\n    return 0;\n}\n',
  },
  {
    id: "c",
    label: "C",
    runtime: "c",
    version: "10.2.0",
    filename: "main.c",
    starter:
      '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from C\\n");\n    return 0;\n}\n',
  },
  {
    id: "go",
    label: "Go",
    runtime: "go",
    version: "1.16.2",
    filename: "main.go",
    starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go")\n}\n',
  },
  {
    id: "rust",
    label: "Rust",
    runtime: "rust",
    version: "1.68.2",
    filename: "main.rs",
    starter: 'fn main() {\n    println!("Hello from Rust");\n}\n',
  },
  {
    id: "java",
    label: "Java",
    runtime: "java",
    version: "15.0.2",
    filename: "Main.java",
    starter:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java");\n    }\n}\n',
  },
  {
    id: "kotlin",
    label: "Kotlin",
    runtime: "kotlin",
    version: "1.8.20",
    filename: "main.kt",
    starter: 'fun main() {\n    println("Hello from Kotlin")\n}\n',
  },
  {
    id: "swift",
    label: "Swift",
    runtime: "swift",
    version: "5.3.3",
    filename: "main.swift",
    starter: 'print("Hello from Swift")\n',
  },
  {
    id: "csharp",
    label: "C#",
    runtime: "csharp.net",
    version: "5.0.201",
    filename: "main.cs",
    starter:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#");\n    }\n}\n',
  },
  {
    id: "bash",
    label: "Bash",
    runtime: "bash",
    version: "5.2.0",
    filename: "main.sh",
    starter: 'echo "Hello from Bash"\n\nfor index in 1 2 3; do\n  echo "count $index"\ndone\n',
  },
];

export const DEFAULT_LANGUAGE: RunnableLanguage = RUNNABLE_LANGUAGES[0] as RunnableLanguage;

export function findLanguage(id: string): RunnableLanguage {
  return RUNNABLE_LANGUAGES.find((language) => language.id === id) ?? DEFAULT_LANGUAGE;
}
