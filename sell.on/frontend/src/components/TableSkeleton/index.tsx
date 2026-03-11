import React from 'react';
import {
  SkeletonTable,
  SkeletonThead,
  SkeletonTh,
  SkeletonTbody,
  SkeletonTr,
  SkeletonTd,
  SkeletonBar,
} from './styles';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 8, cols = 5 }) => {
  return (
    <SkeletonTable>
      <SkeletonThead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonTh key={i}>
              <SkeletonBar $width={i === 0 ? '60%' : i === cols - 1 ? '40%' : '70%'} />
            </SkeletonTh>
          ))}
        </tr>
      </SkeletonThead>
      <SkeletonTbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <SkeletonTr key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <SkeletonTd key={colIndex}>
                <SkeletonBar
                  $width={
                    colIndex === 0 ? '75%' : colIndex === cols - 1 ? '30%' : '55%'
                  }
                />
              </SkeletonTd>
            ))}
          </SkeletonTr>
        ))}
      </SkeletonTbody>
    </SkeletonTable>
  );
};
