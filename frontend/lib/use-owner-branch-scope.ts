'use client';

import { useEffect, useState } from 'react';
import { getBranches, type ApiBranch } from './api';

export function useOwnerBranchScope() {
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [branchScope, setBranchScope] = useState('all');
  const [branchesLoading, setBranchesLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void Promise.resolve()
      .then(getBranches)
      .then((items) => {
        if (active) setBranches(items);
      })
      .catch(() => {
        if (active) setBranches([]);
      })
      .finally(() => {
        if (active) setBranchesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    branches,
    branchScope,
    setBranchScope,
    branchesLoading,
  };
}
