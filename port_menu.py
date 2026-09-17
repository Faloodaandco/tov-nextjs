import os
import re

old_path = r"c:\Users\user\Desktop\TOV-website\src\pages\Menu.tsx"
new_path = r"c:\Users\user\Desktop\tov-nextjs\src\app\[locationId]\menu\page.tsx"

def port_file():
    with open(old_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 'use client'
    if not content.startswith("'use client';"):
        content = "'use client';\n" + content

    # 2. & 3. & 4. & 5. & 6.
    if 'react-router-dom' in content:
        content = re.sub(r"import\s+.*?from\s+['\"]react-router-dom['\"];", "", content)
        content = "import Link from 'next/link';\nimport { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';\n" + content
    
    content = content.replace("<Link to=", "<Link href=")
    content = content.replace("useNavigate()", "useRouter()")
    content = content.replace("const navigate = ", "const router = ")
    content = content.replace("navigate(", "router.push(")
    content = re.sub(r"useParams<[^>]+>\(\)", "useParams()", content)
    content = content.replace("useLocation()", "usePathname()")
    content = content.replace("const location = ", "const pathname = ")
    content = content.replace("location.pathname", "pathname")

    # 7. SEOHead
    content = re.sub(r"import\s+SEOHead\s+from\s+['\"].*?SEOHead['\"];?", "", content)
    content = re.sub(r"import\s+\{.*\}\s+from\s+['\"]react-helmet-async['\"];?", "", content)
    content = re.sub(r"<SEOHead[\s\S]*?/>", "", content)

    # 8. Aliases
    content = content.replace("from '../context/StoreContext'", "from '@/context/StoreContext'")
    content = content.replace("from '../context/AuthContext'", "from '@/context/AuthContext'")
    content = content.replace("from '../shopConfig'", "from '@/config/shopConfig'")
    content = content.replace("from '../firebaseConfig'", "from '@/lib/firebase'")
    content = re.sub(r"from\s+['\"]../services/([^'\"]+)['\"]", r"from '@/services/\1'", content)
    content = re.sub(r"from\s+['\"]../hooks/([^'\"]+)['\"]", r"from '@/hooks/\1'", content)
    content = re.sub(r"from\s+['\"]../types([^'\"]*)['\"]", r"from '@/types\1'", content)
    content = content.replace("from '../constants'", "from '@/config/menuItems'")
    content = re.sub(r"from\s+['\"]../utils/([^'\"]+)['\"]", r"from '@/utils/\1'", content)
    content = re.sub(r"from\s+['\"]../components/([^'\"]+)['\"]", r"from '@/components/\1'", content)
    content = re.sub(r"from\s+['\"]./components/([^'\"]+)['\"]", r"from '@/components/\1'", content)
    content = re.sub(r"from\s+['\"]./([^'\"]+)['\"]", r"from '@/components/\1'", content)

    # 9. Guard window, localStorage, document, navigator
    content = re.sub(r"(?<![a-zA-Z0-9_$])window\.", "(typeof window !== 'undefined' ? window : {}).", content)
    content = re.sub(r"(?<![a-zA-Z0-9_$])localStorage\.", "(typeof window !== 'undefined' ? window.localStorage : {}).", content)
    content = re.sub(r"(?<![a-zA-Z0-9_$])document\.", "(typeof document !== 'undefined' ? document : {}).", content)
    content = re.sub(r"(?<![a-zA-Z0-9_$])navigator\.", "(typeof navigator !== 'undefined' ? navigator : {}).", content)

    # Clean up double wrapping if it happens
    content = content.replace("typeof (typeof window !== 'undefined' ? window : {}). !== 'undefined'", "typeof window !== 'undefined'")

    # 10. export default function MenuPage
    content = content.replace("export const Menu = () => {", "function MenuPageContent() {")
    content = content.replace("const Menu = () => {", "function MenuPageContent() {")
    content = re.sub(r"export\s+default\s+Menu;?", "", content)

    # 12. browser-image-compression
    if 'browser-image-compression' in content:
        content = re.sub(r"import\s+imageCompression\s+from\s+['\"]browser-image-compression['\"];", 
                         "// dynamic import used for imageCompression", content)
        content = content.replace("imageCompression(", "(await import('browser-image-compression')).default(")

    # 11. Suspense wrapper
    wrapper = """
import { Suspense } from 'react';
export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading Menu...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
"""
    content = content + "\n" + wrapper

    os.makedirs(os.path.dirname(new_path), exist_ok=True)
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("File ported successfully to new location.")

if __name__ == "__main__":
    port_file()
