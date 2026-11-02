import { useNavigate } from 'react-router-dom';
import { unLink } from '@/utils/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface Props {
    items: {
        id: number | string;
        label: string;
        link: string | ((id: string) => string);
        description?: string;
    }[]
}

const Menu = (props: Props) => {
    const navigate = useNavigate()
    return (
        <div className='rounded-md border divide-y divide-border w-full max-w-4xl h-fit cursor-pointer'>
            {props.items.map((menu, index) => (
                <div key={menu.id} className={`w-full flex justify-between items-center p-4 ${index !== props.items.length - 1 ? 'border-border/50 border-b' : ''}`} onClick={() => {
                    navigate(unLink(menu.link))
                }}>
                    <div className='flex items-center gap-2.5'>
                        <div className=''>
                            <p className='text-md'>{menu.label}</p>
                            <p className='text-muted-foreground text-xs'>{menu.description}</p>
                        </div>
                    </div>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </div>
            ))}
        </div>
    )
}

export default Menu