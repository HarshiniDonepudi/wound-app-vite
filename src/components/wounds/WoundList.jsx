import React from 'react';
import { Link } from 'react-router-dom';

const WoundList = ({ wounds, searchTerm }) => {
  if (wounds.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded shadow">
        {searchTerm ? (
          <p className="text-gray-600">No wounds match your search criteria.</p>
        ) : (
          <p className="text-gray-600">No wound images available.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wound ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Path
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {wounds.map((wound) => (
            <tr key={wound.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {wound.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {wound.path}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                  to={`/annotate/${wound.id}`}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Annotate
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WoundList;