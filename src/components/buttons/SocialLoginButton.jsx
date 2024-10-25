import Image from 'next/image';

const SocialLoginButton = ({ iconSrc, text, altText }) => {
  return (
    <button className="border border-gray-300 rounded px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 transition">
      <Image src={iconSrc} alt={altText} width={20} height={20} className="w-5 h-5" />
      <span>{text}</span>
    </button>
  );
};

export default SocialLoginButton;
