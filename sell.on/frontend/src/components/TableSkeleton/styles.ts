import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const SkeletonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  overflow: hidden;
`;

export const SkeletonThead = styled.thead`
  background: rgba(255, 255, 255, 0.06);
`;

export const SkeletonTh = styled.th`
  padding: 0.6rem 0.75rem;
  text-align: left;
`;

export const SkeletonTbody = styled.tbody``;

export const SkeletonTr = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  &:last-child { border-bottom: none; }
`;

export const SkeletonTd = styled.td`
  padding: 0.6rem 0.75rem;
`;

export const SkeletonBar = styled.span<{ $width?: string }>`
  display: block;
  height: 14px;
  width: ${(p) => p.$width ?? '80%'};
  max-width: 100%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;
