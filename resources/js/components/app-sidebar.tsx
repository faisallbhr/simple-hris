import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, HandCoins, LayoutGrid, ScanEye, Trash } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Payroll',
        href: '/payrolls',
        icon: HandCoins,
    },
    {
        title: 'Access Management',
        href: '/access-management',
        icon: ScanEye,
        children: [
            {
                title: 'Users',
                href: '/users',
            },
            {
                title: 'Roles',
                href: '/roles',
            },
        ],
    },
    {
        title: 'Trash',
        href: '/trash',
        icon: Trash,
        children: [
            {
                title: 'Payroll Trash',
                href: '/trash/payrolls',
            },
            {
                title: 'User Trash',
                href: '/trash/users',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { permissions } = usePage<SharedData>().props.auth;
    const canAccess = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const filteredNavItems = mainNavItems
        .map((item) => {
            if (item.children) {
                const filteredChildren = item.children.filter((child) => {
                    if (child.href === '/users') return canAccess('view_users');
                    if (child.href === '/roles') return canAccess('view_roles');
                    if (child.href === '/trash/payrolls') return canAccess('view_payrolls_trash');
                    if (child.href === '/trash/users') return canAccess('view_users_trash');
                    return false;
                });

                if (filteredChildren.length > 0) {
                    return { ...item, children: filteredChildren };
                }

                return null;
            }

            if (item.href === '/dashboard') return item;
            if (item.href === '/payrolls' && canAccess('view_payrolls')) return item;

            return null;
        })
        .filter(Boolean) as NavItem[];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
