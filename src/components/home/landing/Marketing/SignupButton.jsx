import { Button } from '@mantine/core';
import { clsx } from 'clsx';

export function SignUpButton({ className, children = 'Sign Up Free', ...props }) {
  return (
    <Button
      className={clsx(
        "!bg-[#036] !text-white !text-sm sm:!text-base md:!text-lg !font-normal !rounded-lg !px-3 sm:!px-4 !py-1.5 sm:!py-2 !border-0 !transition-colors !duration-200 hover:!bg-[#556045]",
        className
      )}
      radius="lg"
      size="md"
      {...props}
    >
      {children}
    </Button>
    
  );
}

export default SignUpButton;
