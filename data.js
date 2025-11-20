// Mock Data for the Application

const productionData = {
    daily: [
        { date: '월', value: 1250 },
        { date: '화', value: 1450 },
        { date: '수', value: 1350 },
        { date: '목', value: 1600 },
        { date: '금', value: 1550 },
        { date: '토', value: 900 },
        { date: '일', value: 0 }
    ],
    kpi: {
        today: 1550,
        utilization: 87,
        totalMolds: 124,
        repairNeeded: 5
    }
};

const moldData = [
    { id: 'M-001', name: '범퍼 프론트 A형', spec: '2500x1200', location: 'A-01', shots: 15400, status: 'normal' },
    { id: 'M-002', name: '범퍼 리어 B형', spec: '2400x1100', location: 'A-02', shots: 8900, status: 'normal' },
    { id: 'M-003', name: '도어 패널 좌측', spec: '1800x900', location: 'B-05', shots: 45200, status: 'repair' },
    { id: 'M-004', name: '도어 패널 우측', spec: '1800x900', location: 'B-06', shots: 44800, status: 'normal' },
    { id: 'M-005', name: '센터 콘솔 상판', spec: '600x400', location: 'C-12', shots: 1200, status: 'normal' },
    { id: 'M-006', name: '대시보드 메인', spec: '3000x1500', location: 'D-01', shots: 98000, status: 'disposal' },
    { id: 'M-007', name: '휠 하우스 커버', spec: '800x800', location: 'C-03', shots: 23000, status: 'normal' },
    { id: 'M-008', name: '라디에이터 그릴', spec: '1200x600', location: 'A-04', shots: 31000, status: 'repair' },
    { id: 'M-009', name: '사이드 미러 커버 L', spec: '300x200', location: 'E-01', shots: 5600, status: 'normal' },
    { id: 'M-010', name: '사이드 미러 커버 R', spec: '300x200', location: 'E-02', shots: 5500, status: 'normal' },
    { id: 'M-011', name: '헤드램프 하우징', spec: '900x500', location: 'B-02', shots: 18900, status: 'normal' },
    { id: 'M-012', name: '테일램프 하우징', spec: '850x450', location: 'B-03', shots: 17500, status: 'normal' }
];
