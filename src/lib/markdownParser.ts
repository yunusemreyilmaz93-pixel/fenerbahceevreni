import { FactionNode } from '../types';

export function parseMarkdownToTree(markdown: string): FactionNode {
  const lines = markdown.split('\n');
  const root: FactionNode = {
    id: 'root',
    name: 'Fenerbahçe Spor Kulübü',
    depth: 0,
    children: [],
  };

  const stack: { node: FactionNode; level: number }[] = [{ node: root, level: -1 }];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Determine level based on prefix
    let level = -1;
    let name = '';

    // Level 0: # Title (ignore or set as root name if needed)
    if (trimmed.startsWith('# ')) {
      return;
    }

    // Level 1: ## Category
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      level = 1;
      name = h2Match[1].replace(/^\d+\.\s+/, '');
    }

    // Level 2: ### Subcategory
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      level = 2;
      name = h3Match[1].replace(/^\d+\.\s+/, '');
    }

    // Level 3+: - List items
    const listMatch = line.match(/^(\s*)-\s+(.+)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      // Map indentation to levels 3, 4, 5...
      level = 3 + Math.floor(indent / 2);
      name = listMatch[2].trim();
    }

    if (level !== -1 && name) {
      const newNode: FactionNode = {
        id: `node-${level}-${name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')}-${index}`,
        name,
        depth: level,
        children: [],
      };

      // Pop from stack until we find the parent (level - 1)
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level });
    }
  });

  return root;
}
