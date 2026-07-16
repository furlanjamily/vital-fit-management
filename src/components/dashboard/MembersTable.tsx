"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/common/form";
import { Table, type TableColumn } from "@/components/common/table/Table";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type Member = {
  name: string;
  email: string;
  expired: string;
  age: string;
  status: string;
  tel: string;
  lastVisited: string;
  avatar: string;
};

const members: Member[] = [
  {
    name: "Bessie Cooper",
    email: "bessie.cooper@email.com",
    expired: "08/05/24",
    age: "24",
    status: "Active",
    tel: "207 555-0119",
    lastVisited: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Jerome Bell",
    email: "jerome.bell@email.com",
    expired: "12/06/24",
    age: "31",
    status: "Active",
    tel: "405 555-0128",
    lastVisited: "2 days ago",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Marvin McKinney",
    email: "marvin.mckinney@email.com",
    expired: "15/07/24",
    age: "28",
    status: "Active",
    tel: "316 555-0116",
    lastVisited: "3 days ago",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Theresa Webb",
    email: "theresa.webb@email.com",
    expired: "20/08/24",
    age: "26",
    status: "Active",
    tel: "704 555-0127",
    lastVisited: "Last week",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=96&q=80",
  },
];

const columns: TableColumn<Member>[] = [
  {
    key: "name",
    header: "Member Name",
    searchValue: (member) => `${member.name} ${member.email}`,
    render: (member) => (
      <div className="flex items-center gap-2.5">
        <span
          className="size-8 shrink-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${member.avatar})` }}
        />
        <div>
          <p className={glassTextStyles.entityName}>{member.name}</p>
          <p className={glassTextStyles.entityEmail}>{member.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "expired",
    header: "Expired Date",
    searchValue: (member) => member.expired,
    render: (member) => member.expired,
  },
  {
    key: "age",
    header: "Age",
    searchValue: (member) => member.age,
    render: (member) => member.age,
  },
  {
    key: "status",
    header: "Status",
    searchValue: (member) => member.status,
    render: (member) => (
      <span className={cn("inline-flex rounded-full border border-white/12 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}>
        {member.status}
      </span>
    ),
  },
  {
    key: "tel",
    header: "Tel",
    searchValue: (member) => member.tel,
    render: (member) => member.tel,
  },
  {
    key: "lastVisited",
    header: "Last Visited",
    render: (member) => member.lastVisited,
  },
];

export function MembersTable() {
  return (
    <Table
      data={members}
      columns={columns}
      getRowId={(member) => member.email}
      title="All Members"
      searchPlaceholder="Search"
      headerActions={
        <Button variant="glass" size="sm" className={cn("gap-2 px-3 py-2.5 font-normal", glassText.secondary)}>
          Sort by: Expired Soon
          <ChevronDown className="size-3.5" />
        </Button>
      }
    />
  );
}
