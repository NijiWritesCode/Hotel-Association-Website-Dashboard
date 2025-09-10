import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import ExecutiveManagement from './Pages/Executive-Management/ExecutiveManagement.jsx'
import EventManagement from './Pages/Event-Management/EventManagement.jsx'
import MembersManagement from './Pages/Members-Management/MembersManagement.jsx'
import NotFound from './Pages/Not-Found/NotFound.jsx'
import MemContext from './Context/MemberContext/MemContext.jsx'
import ExecutiveContextProvider from './Context/Exec/ExecContext.jsx'
import EventContextProvider from './Context/Event/EventContextProvider.jsx'
import Advert from './Pages/Advert/Advert.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MemContext>
            <EventContextProvider>
              <ExecutiveContextProvider>
                <Dashboard />
              </ExecutiveContextProvider>
              </EventContextProvider>
              </MemContext>
  },

  {
    path: '/executive-management',
    element: <ExecutiveManagement />
  },

  {
    path: '/event-management',
    element: <EventManagement />
  },

  {
    path: '/members-management',
    element: <MembersManagement />
  },
  
  {
    path: '/advertisement',
    element: <Advert />
  }, 

  {
    path: '*',
    element: <NotFound />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
