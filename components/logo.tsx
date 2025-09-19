import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 hover:opacity-80 transition-opacity ${className}`}>
      <div className="relative">
        <Image
          src="/logo.png"
          alt="Foodle Logo"
          width={sizes[size].icon}
          height={sizes[size].icon}
          className="rounded-lg"
        />
      </div>
      {showText && <span className={`font-bold text-primary ${sizes[size].text}`}>Foodle</span>}
    </Link>
  )
}
