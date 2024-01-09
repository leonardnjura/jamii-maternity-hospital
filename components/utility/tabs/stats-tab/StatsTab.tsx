import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  Title,
} from 'chart.js';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { FallingLines } from 'react-loader-spinner';
import { lnoApiKeySysOps } from '../../../../config';
import DataStore from '../../../../context/app/DataStore';
import { IDataset, IHospitalClient, IUserData } from '../../../../data/types';
import { loadOneItemFromClients } from '../../../../lib/get-clients';
import { loadOneUser, loadUsers_Midwives } from '../../../../lib/get-users';
import { determineDaysLeftBeforeClientDischarge } from '../../../../services/subscription.service';
import { isEven, thousandsOfCommas, wait } from '../../../../utils/preops';
import Loader from '../../loader/Loader';

export interface IStatsTab {
  midwifeOfInterest: IUserData;
}

const StatsTab: React.FC<IStatsTab> = ({ midwifeOfInterest }) => {
  const router = useRouter();
  const {
    theme,
    setTheme,

    authenticatedUser,
  } = useContext(DataStore);

  const defaultChartLabels: string[] = [];
  const defaultChartDatasets: IDataset[] = [];

  //**State*/

  const [incomeChartLabels, setIncomeChartLabels] =
    useState(defaultChartLabels);
  const [incomeChartDatasets, setIncomeChartDatasets] =
    useState(defaultChartDatasets);

  const [loadingThings, setLoadingThings] = useState(false);
  const [highlightingThings, setHighlightingThings] = useState(false);
  const [grandTotalAssignmentCount, setGrandTotalAssignmentCount] = useState(0);
  const [
    grandTotalHospitalizationDaysCount,
    setGrandTotalHospitalizationDaysCount,
  ] = useState(0);

  const [displayBarChart, setDisplayBarChart] = useState(true);

  const [highlightedMidwifeId, setHighlightedMidwifeId] = useState('');

  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/
  useEffect(() => {
    fetchSh_t(true);
  }, []);
  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/

  const fetchSh_t = async (tabDisplayAuthorized: boolean) => {
    //do it..
    if (tabDisplayAuthorized) {
      setLoadingThings(true);
      ///🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🎻

      fetchStats();

      ///🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🎻
      setLoadingThings(false);
    }
  };

  const reset = () => {
    //reset

    setHighlightedMidwifeId('');

    let midwifeIdees: string[] = [];

    loadStats(midwifeIdees); //clr
  };

  const fetchStats = async () => {
    let midwifeIdees: string[] = [];

    const dbMidwives: IUserData[] = await loadUsers_Midwives(lnoApiKeySysOps!);

    for (let i = 0; i < dbMidwives.length; i++) {
      midwifeIdees.push(dbMidwives[i]._id!);
    }

    loadStats(midwifeIdees); //pump in
  };

  const loadStats = async (midwifeIdees: string[]) => {
    let datasets: IDataset[] = [];
    ///Sample Datasets:

    //[
    // {
    //   label: 'Dataset 1',
    //   data: [2,6,7,4,12],
    //   borderColor: 'rgb(255, 99, 132)',
    //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
    // },
    // {
    //   label: 'Dataset 2',
    //   data: [5,10,2,8,9],
    //   borderColor: 'rgb(255, 99, 128)',
    //   backgroundColor: 'rgba(255, 99, 128, 0.5)',
    // },
    //]

    ///

    let defendingMaxAssignmentCount = 0;

    let _grandTotalAssignmentCount = 0;
    let _grandTotalHospitalizationDaysCount = 0;

    for (let i = 0; i < midwifeIdees.length; i++) {
      let data: any[] = [];

      let midwifeId = midwifeIdees[i];
      const midWifeData: IUserData = await loadOneUser(
        midwifeId,
        lnoApiKeySysOps!
      );

      if (midwifeId) {
        let isAlternate = isEven(i);
        let isHiglighted = midwifeId == highlightedMidwifeId;

        let borderColor = isHiglighted
          ? 'rgb(22, 163, 74)' //green
          : isAlternate
          ? 'rgb(37, 99, 235)' //blue
          : 'rgb(248, 113, 113)'; //hotpink

        let backgroundColor = isHiglighted
          ? 'rgba(22, 163, 74, 0.5)' //green-alpha
          : isAlternate
          ? 'rgb(37, 99, 235, 0.5)' //blue-alpha
          : 'rgba(248, 113, 113, 0.5)'; //hotpink-alpha

        //chart ops..

        if (
          midWifeData &&
          midWifeData.clientAssignments &&
          midWifeData.clientAssignments.length > 0
        ) {
          _grandTotalAssignmentCount =
            _grandTotalAssignmentCount + midWifeData.clientAssignments.length;

          console.log(
            `!!${midWifeData.firstName} has a total of ${midWifeData.clientAssignments.length} assignments`
          );

          let defendingMaxAssignmentCountHasChanged =
            midWifeData.clientAssignments.length > defendingMaxAssignmentCount;
          if (defendingMaxAssignmentCountHasChanged) {
            defendingMaxAssignmentCount = midWifeData.clientAssignments.length;
          }

          if (defendingMaxAssignmentCountHasChanged) {
            //all labels, done once; we can use this guaranteed iteration
            let labels: string[] = [];

            for (let j = 0; j < defendingMaxAssignmentCount; j++) {
              //+1 to strech out chart x-axis
              // labels.push(j.toString());
              labels.push(`dataset ${j + 1}`);
            }
            //Sample Labels:
            //setIncomeChartLabels(['2000', '2001', '2002', '2003', '2004']);
            setIncomeChartLabels(labels);
          }

          for (let i = midWifeData.clientAssignments.length - 1; i >= 0; i--) {
            //note: put nulls so line chart breaks where label data is not available
            let clientId = midWifeData.clientAssignments[i].assignmentRef;
            let clientData: IHospitalClient = await loadOneItemFromClients(
              clientId,
              lnoApiKeySysOps!
            );

            let daysLeftToDischarge = 0;

            if (clientData) {
              daysLeftToDischarge =
                determineDaysLeftBeforeClientDischarge(clientData);

              _grandTotalHospitalizationDaysCount =
                _grandTotalHospitalizationDaysCount + daysLeftToDischarge;
            }

            data.push(daysLeftToDischarge);
          }
          let label = `${midWifeData._id}: ${midWifeData.firstName}`;
          let datasetEntry: IDataset = {
            label,
            data,
            borderColor,
            backgroundColor,
          };

          datasets.push(datasetEntry);
        }
      } //
    }

    setGrandTotalAssignmentCount(_grandTotalAssignmentCount);
    setGrandTotalHospitalizationDaysCount(_grandTotalHospitalizationDaysCount);

    setIncomeChartDatasets(datasets);

    ///
  };

  const chartData = {
    labels: incomeChartLabels,
    datasets: incomeChartDatasets,
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    LogarithmicScale
  );

  const knockoutExistsOnEitherSide = false;

  const chartTitle = `Distribution of ${thousandsOfCommas(
    grandTotalHospitalizationDaysCount
  )} days`;

  return (
    <div>
      {loadingThings ? (
        <Loader
          loading={loadingThings}
          absoluteItems={'Preparing data..'}
          standbyNotes={''}
        />
      ) : (
        <>
          <div className="my-tab">
            {!displayBarChart ? (
              <Line
                options={{
                  plugins: {
                    legend: {
                      display: false,
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: chartTitle, //chart label
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        display: true,
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        display: true,
                      },
                      grid: {
                        display: true,
                      },
                      type: knockoutExistsOnEitherSide
                        ? 'logarithmic'
                        : 'linear',
                    },
                  },
                }}
                data={chartData}
              />
            ) : (
              <Bar
                options={{
                  plugins: {
                    legend: {
                      display: false,
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: chartTitle, //chart label
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        display: true,
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        display: true,
                      },
                      grid: {
                        display: true,
                      },
                      type: knockoutExistsOnEitherSide
                        ? 'logarithmic'
                        : 'linear',
                    },
                  },
                }}
                data={chartData}
              />
            )}
            {/* <div className="mt-8 flex flex-col justify-center items-center">
        <button
          className="my-btn py-2 rounded-full w-44 sm:w-44 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400"
          onClick={() => {
            setDisplayBarChart(!displayBarChart);
          }}
        >
          Toggle charts
        </button>
      </div> */}
            <div className="mt-8 flex flex-col justify-center items-center">
              <input
                autoFocus={true}
                type="text"
                className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
                placeholder="enter midwife id to highlight.."
                value={highlightedMidwifeId}
                onChange={(e) => {
                  setHighlightedMidwifeId(e.target.value);
                }}
              />

              {highlightingThings && (
                <FallingLines color="#2F64EB" width="50" visible={true} />
              )}

              <span>
                <br />
                <button
                  className="my-btn py-2 rounded-full w-36 sm:w-36 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400 hover:text-red-600"
                  onClick={async (e) => {
                    e.preventDefault();

                    setHighlightingThings(true);
                    ////

                    await fetchStats();

                    setHighlightingThings(false);
                    ////
                  }}
                  disabled={highlightedMidwifeId.trim().length == 0}
                >
                  Highlight
                </button>
              </span>
            </div>{' '}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsTab;
