CREATE OR REPLACE FUNCTION public.resource_visible_by_user(p_resource_type text, p_resource_id uuid, p_company_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super rule: USER MRX sees all
  IF public.is_user_mrx() THEN
    RETURN TRUE;
  END IF;

  -- Superuser role sees all
  IF public.has_role(auth.uid(), 'superuser'::public.user_role) THEN
    RETURN TRUE;
  END IF;

  -- Admin role with company access sees all
  IF public.has_role(auth.uid(), 'administrador'::public.user_role) AND public.user_can_access_empresa(p_company_id) THEN
    RETURN TRUE;
  END IF;

  -- Possessing ADMINISTRATIVO module in the company grants visibility to all
  IF public.user_has_module_in_company('administrativo', p_company_id) THEN
    RETURN TRUE;
  END IF;

  -- Otherwise require intersection of resource departments with user's departments
  RETURN EXISTS (
    SELECT 1
    FROM public.department_assignments da
    JOIN public.user_departments ud ON ud.department_id = da.department_id AND ud.user_id = auth.uid()
    WHERE da.resource_type = p_resource_type
      AND da.resource_id = p_resource_id
      AND da.company_id = p_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
