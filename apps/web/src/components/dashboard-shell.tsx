'use client';

import { ReactNode, useMemo, useState } from 'react';

export type DashboardMenuItem = {
  label: string;
  badge?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children?: DashboardMenuItem[];
};

export type DashboardMenuGroup = {
  label: string;
  description?: string;
  defaultOpen?: boolean;
  items: DashboardMenuItem[];
};

export function DashboardShell({
  title,
  menus,
  menuGroups,
  children
}: {
  title: string;
  menus?: string[];
  menuGroups?: DashboardMenuGroup[];
  children: ReactNode;
}) {
  const groups = useMemo<DashboardMenuGroup[]>(() => {
    if (menuGroups?.length) return menuGroups;
    return [{
      label: 'Menu Utama',
      description: 'Fungsi dashboard',
      defaultOpen: true,
      items: (menus || []).map((menu, index) => ({ label: menu, active: index === 0 }))
    }];
  }, [menuGroups, menus]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return groups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.label] = false;
      return acc;
    }, {});
  });

  const toggleGroup = (label: string) => setOpenGroups((current) => ({ [label]: !current[label] }));
  const openGroup = (label: string) => setOpenGroups({ [label]: true });
  const closeGroups = () => setOpenGroups({});

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#151515]" data-layout="horizontal" data-sidebar-style="full">
      <div className="mx-auto max-w-[1120px] px-4 py-3 lg:px-0">
        <nav className="relative z-40 rounded-xl bg-[#42b429] px-4 py-2.5 shadow-[0_18px_35px_rgba(66,180,41,0.18)]">
          <div className="flex items-center gap-5 overflow-visible">
            <a href="/admin" className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-white/15 p-1 shadow-inner">
              <img src="/template-assets/assets/images/profile/pic1.jpg" alt="Profil" className="h-full w-full rounded-full object-cover grayscale" />
            </a>
            <ul className="flex flex-1 flex-wrap items-center justify-center gap-1 md:gap-3">
              {groups.map((group, groupIndex) => {
                const open = openGroups[group.label];
                return (
                  <li
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => openGroup(group.label)}
                    onMouseLeave={closeGroups}
                    onFocus={() => openGroup(group.label)}
                  >
                    <button
                      type="button"
                      className={`flex min-w-[78px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-center text-white transition ${open ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      onClick={() => toggleGroup(group.label)}
                      aria-expanded={open}
                    >
                      <TemplateIcon name={groupIcon(groupIndex)} className="h-4 w-4 brightness-0 invert" />
                      <span className="max-w-[110px] truncate text-[11px] leading-4">{group.label}</span>
                    </button>
                    {open ? (
                      <div className="absolute left-1/2 top-[calc(100%+0px)] z-50 w-[310px] -translate-x-1/2 pt-2">
                        <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
                        <div className="mb-2 rounded-lg bg-[#f6f6f6] px-3 py-2">
                          <p className="text-xs font-black text-[#151515]">{group.label}</p>
                          {group.description ? <p className="text-[11px] text-slate-500">{group.description}</p> : null}
                        </div>
                        <ul className="grid gap-1">
                          {group.items.map((item, itemIndex) => (
                            <li key={`${group.label}-${item.label}`}>
                              <MenuItem item={item} index={groupIndex + itemIndex} />
                            </li>
                          ))}
                        </ul>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <section className="mt-11 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard color="bg-[#ffa752]" icon="receipt.svg" value="2478" label="Total Data Akademik" />
          <DashboardMetricCard color="bg-[#5bdd5a]" icon="check-circle.svg" value="983" label="Data Tervalidasi" />
          <DashboardMetricCard color="bg-[#b58ad8]" icon="x-circle.svg" value="1256" label="Perlu Review" />
          <DashboardMetricCard color="bg-[#70a1bb]" icon="journal-text.svg" value="652" label="Laporan Tersedia" />
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#42b429]">Sistem Informasi Akademik</p>
              <h1 className="text-2xl font-black text-[#111]">{title}</h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white px-4 py-2 text-slate-600 shadow-sm">Universitas Contoh Nusantara</span>
              <span className="rounded-full bg-[#e9f8e6] px-4 py-2 text-[#2f941d]">Ganjil 2026/2027</span>
            </div>
          </div>
          <div className="min-h-full overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.07)]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function MenuItem({ item, index }: { item: DashboardMenuItem; index: number }) {
  const hasChildren = Boolean(item.children?.length);
  const active = menuItemIsActive(item);
  const content = (
    <>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {hasChildren ? <span className={`text-[11px] font-black ${active ? 'text-[#0d8178]' : 'text-slate-400'}`}>{'>'}</span> : null}
    </>
  );

  const className = `mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${active ? 'bg-[#f0fbea] font-black text-[#2f941d]' : 'text-slate-600 hover:bg-[#f7f7f7]'}`;

  if (hasChildren) {
    return (
      <div className="group/submenu relative">
        <button type="button" className={className} aria-haspopup="menu" aria-expanded={active}>
          {content}
        </button>
        <div className="hidden pl-6 group-hover/submenu:block group-focus-within/submenu:block md:absolute md:left-[calc(100%-4px)] md:top-0 md:w-[285px] md:pl-2">
          <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
            <p className="mb-2 rounded-lg bg-[#f6f6f6] px-3 py-2 text-[11px] font-black text-[#151515]">{item.label}</p>
            <ul className="grid gap-1">
              {item.children?.map((child, childIndex) => (
                <li key={`${item.label}-${child.label}`}>
                  <MenuItem item={child} index={index + childIndex + 1} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (item.href) {
    return <a href={item.href} className={className}>{content}</a>;
  }

  return <button type="button" onClick={item.onClick} className={className}>{content}</button>;
}

function menuItemIsActive(item: DashboardMenuItem): boolean {
  return Boolean(item.active || item.children?.some((child) => menuItemIsActive(child)));
}

function TemplateIcon({ name, className }: { name: string; className?: string }) {
  return <img src={`/template-assets/assets/icons/bootstrap-icons/icons/${name}`} alt="" className={className} aria-hidden="true" />;
}

function groupIcon(index: number) {
  const icons = ['collection.svg', 'journal-bookmark.svg', 'people.svg', 'calendar-check.svg', 'cash-stack.svg', 'grid.svg'];
  return icons[index % icons.length];
}

function DashboardMetricCard({ color, icon, value, label }: { color: string; icon: string; value: string; label: string }) {
  return (
    <article className={`relative min-h-[114px] overflow-hidden rounded-2xl ${color} p-6 text-white shadow-[0_10px_22px_rgba(0,0,0,0.08)]`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rotate-45 rounded-3xl bg-white/10" />
      <div className="absolute -bottom-10 right-4 h-24 w-24 rounded-3xl bg-black/5" />
      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/25">
          <TemplateIcon name={icon} className="h-6 w-6 brightness-0 invert" />
        </span>
        <span>
          <span className="block text-3xl font-black leading-none">{value}</span>
          <span className="mt-2 block text-sm">{label}</span>
        </span>
      </div>
    </article>
  );
}
