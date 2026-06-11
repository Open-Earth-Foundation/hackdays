"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  NativeSelect,
  Table,
  Text,
} from "@chakra-ui/react";

export type Row = {
  ibge: string;
  name: string;
  uf: string;
  capag: string;
  debt: string;
  savings: string;
  liquidity: string;
  icf: string;
  locode: string;
};

const TIERS = ["A+", "A", "B+", "B", "C", "D", "n.d.", "n.e."] as const;

const TIER_TOKEN: Record<string, string> = {
  "A+": "rating.aplus",
  A: "rating.a",
  "B+": "rating.bplus",
  B: "rating.b",
  C: "rating.c",
  D: "rating.d",
  "n.d.": "rating.nd",
  "n.e.": "rating.ne",
};

const TIER_LABELS: Record<string, string> = {
  "A+": "bankable, top accounting",
  A: "bankable",
  "B+": "credit-eligible",
  B: "credit-eligible",
  C: "no federal credit → blended finance",
  D: "bottom tier",
  "n.d.": "not rated (bad data) → TA market",
  "n.e.": "not evaluated",
};

function TierBadge({ tier }: { tier: string }) {
  return (
    <Badge
      bg={TIER_TOKEN[tier] ?? "border.neutral"}
      color={tier === "n.e." ? "content.secondary" : "base.light"}
      fontWeight="700"
      minW="26px"
      justifyContent="center"
    >
      {tier}
    </Badge>
  );
}

export default function Explorer({ rows }: { rows: Row[] }) {
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [uf, setUf] = useState("");
  const [q, setQ] = useState("");

  const ufs = useMemo(() => Array.from(new Set(rows.map((r) => r.uf))).sort(), [rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.capag] = (c[r.capag] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!tierFilter || r.capag === tierFilter) &&
        (!uf || r.uf === uf) &&
        (!needle || r.name.toLowerCase().includes(needle))
    );
  }, [rows, tierFilter, uf, q]);

  const shown = filtered.slice(0, 300);

  return (
    <Container maxW="6xl" py="10">
      <Heading size="2xl" color="content.alternative" mb="1">
        CAPAG Funder Scan
      </Heading>
      <Text color="content.tertiary" mb="6">
        {rows.length.toLocaleString()} Brazilian municipalities — Treasury fiscal capacity
        (CAPAG, Nov 2025) joined to CityCatalyst climate data. Indicative screening signal,
        not a credit decision.
      </Text>

      <Flex gap="2" wrap="wrap" mb="6">
        {TIERS.map((t) => (
          <Button
            key={t}
            onClick={() => setTierFilter(tierFilter === t ? null : t)}
            variant="outline"
            h="auto"
            py="2.5"
            px="3.5"
            bg="background.default"
            borderColor={tierFilter === t ? "interactive.secondary" : "border.neutral"}
            borderWidth={tierFilter === t ? "2px" : "1px"}
            display="block"
            textAlign="left"
            minW="130px"
          >
            <Flex align="center" gap="2">
              <TierBadge tier={t} />
              <Text fontWeight="700" fontFamily="heading">
                {(counts[t] ?? 0).toLocaleString()}
              </Text>
            </Flex>
            <Text fontSize="xs" color="content.tertiary" mt="1" fontWeight="400">
              {TIER_LABELS[t]}
            </Text>
          </Button>
        ))}
      </Flex>

      <Flex gap="3" mb="3">
        <Input
          placeholder="Search municipality…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          bg="background.default"
          flex="1"
        />
        <NativeSelect.Root w="180px" bg="background.default">
          <NativeSelect.Field value={uf} onChange={(e) => setUf(e.target.value)}>
            <option value="">All states</option>
            {ufs.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Flex>

      <Text fontSize="sm" color="content.tertiary" mb="2">
        {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
        {filtered.length > shown.length ? ` — showing first ${shown.length}` : ""}
      </Text>

      <Box bg="background.default" borderRadius="lg" borderWidth="1px" borderColor="border.neutral" overflow="hidden">
        <Table.Root size="sm" striped>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Municipality</Table.ColumnHeader>
              <Table.ColumnHeader>UF</Table.ColumnHeader>
              <Table.ColumnHeader>CAPAG</Table.ColumnHeader>
              <Table.ColumnHeader title="Indicator 1 — consolidated debt / net current revenue">
                Debt
              </Table.ColumnHeader>
              <Table.ColumnHeader title="Indicator 2 — current expenses vs revenues (3yr)">
                Savings
              </Table.ColumnHeader>
              <Table.ColumnHeader title="Indicator 3 — cash vs short-term obligations">
                Liquidity
              </Table.ColumnHeader>
              <Table.ColumnHeader title="Siconfi accounting-quality ranking">ICF</Table.ColumnHeader>
              <Table.ColumnHeader>LOCODE</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {shown.map((r) => (
              <Table.Row key={r.ibge}>
                <Table.Cell fontWeight="500">{r.name}</Table.Cell>
                <Table.Cell color="content.tertiary">{r.uf}</Table.Cell>
                <Table.Cell>
                  <TierBadge tier={r.capag} />
                </Table.Cell>
                <Table.Cell>{r.debt}</Table.Cell>
                <Table.Cell>{r.savings}</Table.Cell>
                <Table.Cell>{r.liquidity}</Table.Cell>
                <Table.Cell color="content.tertiary">{r.icf}</Table.Cell>
                <Table.Cell color="content.tertiary" fontFamily="mono" fontSize="xs">
                  {r.locode}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Container>
  );
}
