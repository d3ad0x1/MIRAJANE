import { useRoutes, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ContainersListPage from "../pages/containers/ContainersListPage";
import ContainerDetailsPage from "../pages/containers/ContainerDetailsPage";
import ImagesListPage from "../pages/images/ImagesListPage";
import VolumesListPage from "../pages/volumes/VolumesListPage";
import TemplatesListPage from "../pages/templates/TemplatesListPage";
import TemplateEditPage from "../pages/templates/TemplateEditorPage";
import CreateContainerPage from "../pages/containers/CreateContainerPage";
import NetworksListPage from "../pages/networks/NetworksListPage";
import CreateNetworkPage from "../pages/networks/CreateNetworkPage";
import ImageDetailsPage from "../pages/images/ImageDetailsPage";
import NetworkDetailsPage from "../pages/networks/NetworkDetailsPage";

export function AppRoutes() {
  const routes = useRoutes([
    {
      path: "/login",
      element: <AuthLayout />,
      children: [{ index: true, element: <LoginPage /> }],
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { index: true, element: <DashboardPage /> },

        // Containers
        { path: "containers", element: <ContainersListPage /> },
        { path: "containers/new", element: <CreateContainerPage /> },
        { path: "containers/:id", element: <ContainerDetailsPage /> },

        // Images
        { path: "images", element: <ImagesListPage /> },
        { path: "images/:id", element: <ImageDetailsPage /> },

        // Volumes
        { path: "volumes", element: <VolumesListPage /> },

        // Networks
        { path: "networks", element: <NetworksListPage /> },
        { path: "networks/new", element: <CreateNetworkPage /> },
        { path: "networks/:id", element: <NetworkDetailsPage /> },

        // Templates
        { path: "templates", element: <TemplatesListPage /> },
        { path: "templates/new", element: <TemplateEditPage mode="create" /> },
        { path: "templates/:id/edit", element: <TemplateEditPage mode="edit" /> },
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return routes;
}
