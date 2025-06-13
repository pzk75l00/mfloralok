// Componente reutilizable para gráficos de reportes
import React from 'react';
import PropTypes from 'prop-types';

const ReportChart = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="bg-gray-50 rounded-lg p-4 shadow">
      {children}
    </div>
  </div>
);

ReportChart.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ReportChart;
